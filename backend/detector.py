"""
PhishShift - Message Risk Scanner
Core Detection Engine Module

Architecture:
- RuleBasedBaselineDetector: Transparent, explainable rule-based baseline expert system
  inspecting URL characteristics (offline/string parsing only, no network calls), urgency patterns,
  credential harvesting lures, and financial solicitation markers.
- MLModelDetector: Pluggable interface for pre-trained machine learning models (e.g. TF-IDF + LogisticRegression / Naive Bayes / Random Forest).
  Gracefully reports 'not configured' if no model artifact is provided, adhering strictly
  to academic honesty without fabricating predictions.
"""

import re
import urllib.parse
from typing import Dict, Any, List, Optional
import os
import logging

logger = logging.getLogger(__name__)

# Known URL shorteners commonly abused in smishing / phishing
KNOWN_SHORTENERS = {
    "bit.ly", "tinyurl.com", "t.co", "is.gd", "buff.ly", "ow.ly", "goo.gl",
    "rebrand.ly", "cutt.ly", "shorturl.at", "tiny.cc", "bc.vc", "rb.gy"
}

# Suspicious / High-Abuse Top-Level Domains frequently registered for throwaway phishing
SUSPICIOUS_TLDS = {
    ".xyz", ".top", ".buzz", ".club", ".tk", ".ml", ".ga", ".cf", ".gq",
    ".cam", ".monster", ".work", ".icu", ".vip", ".click", ".link", ".live",
    ".rest", ".fit", ".surf"
}

# Targeted financial or tech brands commonly spoofed in attacks
COMMON_TARGET_BRANDS = [
    "paypal", "netflix", "apple", "microsoft", "google", "amazon", "chase",
    "wellsfargo", "bankofamerica", "citi", "fedex", "ups", "usps", "dhl",
    "whatsapp", "facebook", "instagram", "telegram", "binance", "coinbase"
]

class RuleBasedBaselineDetector:
    """
    Transparent Baseline Heuristic Detector.
    Evaluates messages against established cybersecurity indicators with deterministic weights.
    All calculations are strictly rule-based, fully explainable, and produce an auditable score.
    """

    def __init__(self):
        self._init_patterns()

    def _init_patterns(self):
        # 1. Credential & Identity Harvesting
        self.credential_patterns = [
            (re.compile(r'\b(password|passcode|pin\s*code|one-time\s*pin|otp|cvv|2fa\s*code)\b', re.IGNORECASE),
             "Explicit Credential Request", "Message asks for highly confidential authentication data (password, OTP, PIN, CVV).", 35, "critical"),
            (re.compile(r'\b(verify\s+your\s+(identity|account|credentials|card|profile)|confirm\s+your\s+login)\b', re.IGNORECASE),
             "Account Verification Lure", "Prompts recipient to verify identity or login credentials via external link.", 20, "high"),
            (re.compile(r'\b(ssn|social\s+security\s+(number)?|tax\s+id|id\s+card|passport)\b', re.IGNORECASE),
             "Government / Sensitive ID Solicitation", "Inquires about national ID, SSN, or passport numbers.", 30, "critical")
        ]

        # 2. Urgency and Coercive Psychological Pressure
        self.urgency_patterns = [
            (re.compile(r'\b(immediately|act\s+now|urgent|within\s+(1|2|4|6|12|24|48)\s*hours?|expires?\s+today|time\s+is\s+running\s+out)\b', re.IGNORECASE),
             "Artificial Urgency / Time Pressure", "Uses tight deadlines to induce panic and rush the recipient into rash actions.", 15, "medium"),
            (re.compile(r'\b(suspended|terminated|deactivated|restricted|frozen|account\s+locked|closure|penalty)\b', re.IGNORECASE),
             "Account Suspension / Disciplinary Threat", "Threatens immediate suspension, lock, or penalties if action is not taken.", 20, "high"),
            (re.compile(r'\b(unauthorized\s+access|security\s+breach|fraud\s+detected|suspicious\s+login|compromised)\b', re.IGNORECASE),
             "Fear / Fraud Scare Tactic", "Claims security breach or unauthorized activity to provoke panic.", 15, "medium")
        ]

        # 3. Financial, Prize, and Advance Fee Solicitations
        self.financial_patterns = [
            (re.compile(r'\b(congratulations|you\s+(have\s+)?won|lottery|lucky\s+winner|claim\s+your\s+(prize|reward|gift\s+card))\b', re.IGNORECASE),
             "Prize / Lottery Scam Pattern", "Promises unexpected rewards or lottery prizes to entice clicking.", 25, "high"),
            (re.compile(r'\b(wire\s+transfer|send\s+crypto|bitcoin\s+wallet|ethereum|western\s+union|gift\s+card\s+code)\b', re.IGNORECASE),
             "Non-Standard Financial Payment Request", "Solitary or irreversible payment methods typically associated with fraudulent requests.", 25, "high"),
            (re.compile(r'\b(refund\s+of\s+(\$|€|£|[0-9]+)|unclaimed\s+funds?|inheritance|deposit\s+pending)\b', re.IGNORECASE),
             "Rebate / Unclaimed Funds Lure", "Prompts receipt of unexpected funds or refunds requiring verification fee.", 20, "medium")
        ]

        # 4. Smishing / SMS Delivery Specific
        self.sms_delivery_patterns = [
            (re.compile(r'\b(delivery\s+failed|package\s+pending|missing\s+address|update\s+shipping\s+address|redelivery\s+fee)\b', re.IGNORECASE),
             "Fake Package / Delivery Exception Scam", "Impersonates postal/shipping courier (USPS/DHL/FedEx) regarding delivery failure.", 20, "high"),
            (re.compile(r'\b(unpaid\s+toll|highway\s+toll|toll\s+violation|traffic\s+infraction)\b', re.IGNORECASE),
             "Fake Toll / Infraction Scam", "Common smishing lure claiming overdue road toll or violation.", 25, "high")
        ]

    def _extract_and_analyze_urls(self, text: str) -> tuple[List[Dict[str, Any]], int]:
        """
        Safely inspects URLs in message using string analysis only.
        DOES NOT make any HTTP/network requests to the target hosts.
        """
        # Regex to extract URLs without executing them
        url_regex = re.compile(
            r'(?:https?:\/\/|www\.)[^\s<>"\',;]+|(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/[^\s<>"\',;]*)?',
            re.IGNORECASE
        )
        matches = url_regex.findall(text)
        
        extracted_info = []
        url_score = 0
        seen_domains = set()

        for raw_url in matches:
            # Normalize scheme for parsing
            norm_url = raw_url if raw_url.startswith(("http://", "https://")) else "http://" + raw_url
            try:
                parsed = urllib.parse.urlparse(norm_url)
                hostname = parsed.netloc.lower()
                # Remove port if present
                if ":" in hostname:
                    hostname = hostname.split(":")[0]
                
                if not hostname or hostname in seen_domains:
                    continue
                seen_domains.add(hostname)

                url_detail = {
                    "raw_url": raw_url,
                    "hostname": hostname,
                    "is_http": parsed.scheme == "http" and raw_url.startswith("http://"),
                    "is_shortener": hostname in KNOWN_SHORTENERS,
                    "is_ip_address": bool(re.match(r'^(?:\d{1,3}\.){3}\d{1,3}$', hostname)),
                    "suspicious_tld": any(hostname.endswith(tld) for tld in SUSPICIOUS_TLDS),
                    "brand_spoofing": [],
                    "findings": []
                }

                # Evaluate risk properties
                if url_detail["is_ip_address"]:
                    url_score += 35
                    url_detail["findings"].append("Uses raw IP address instead of legitimate domain name (high risk).")

                if url_detail["is_shortener"]:
                    url_score += 20
                    url_detail["findings"].append(f"Uses public URL shortener ({hostname}) to conceal destination.")

                if url_detail["suspicious_tld"]:
                    tld_match = next((tld for tld in SUSPICIOUS_TLDS if hostname.endswith(tld)), "")
                    url_score += 20
                    url_detail["findings"].append(f"Registered under high-risk/frequently abused TLD: {tld_match}")

                # Check if brand name is embedded as a subdomain or with hyphenation (e.g. paypal-security.com)
                for brand in COMMON_TARGET_BRANDS:
                    if brand in hostname:
                        # Legitimate exact domain is usually e.g. paypal.com
                        parts = hostname.split('.')
                        root_domain = ".".join(parts[-2:]) if len(parts) >= 2 else hostname
                        if brand not in root_domain or "-" in root_domain or len(parts) > 2:
                            url_detail["brand_spoofing"].append(brand)
                            url_score += 25
                            url_detail["findings"].append(f"Possible brand impersonation of '{brand.capitalize()}' in domain structure.")

                if url_detail["is_http"]:
                    url_score += 10
                    url_detail["findings"].append("Uses unencrypted HTTP protocol for sensitive link.")

                extracted_info.append(url_detail)
            except Exception as e:
                logger.debug(f"Error parsing URL candidate: {raw_url} - {e}")

        return extracted_info, url_score

    def analyze(self, message: str, message_type: str = "Other") -> Dict[str, Any]:
        """
        Executes complete rule-based analysis.
        Returns explainable indicators, risk score (0-100), classification, and safety advice.
        """
        indicators = []
        accumulated_score = 0
        text_lower = message.lower()

        # 1. URL Analysis
        urls_data, url_score = self._extract_and_analyze_urls(message)
        accumulated_score += url_score

        if urls_data:
            has_high_risk_url = any(u["is_ip_address"] or u["brand_spoofing"] or u["suspicious_tld"] for u in urls_data)
            has_shortener = any(u["is_shortener"] for u in urls_data)

            if has_high_risk_url:
                indicators.append({
                    "id": "url_high_risk",
                    "category": "url",
                    "severity": "critical",
                    "title": "High-Risk Link Architecture Detected",
                    "detail": "Message contains links with suspicious elements (raw IP host, deceptive brand impersonation, or abnormal TLD).",
                    "evidence": [u["raw_url"] for u in urls_data if u["findings"]]
                })
            elif has_shortener:
                indicators.append({
                    "id": "url_shortener",
                    "category": "url",
                    "severity": "high",
                    "title": "Obfuscated / Shortened URL Present",
                    "detail": "Message utilizes a URL shortening service to hide destination domain.",
                    "evidence": [u["raw_url"] for u in urls_data if u["is_shortener"]]
                })
            else:
                indicators.append({
                    "id": "url_present",
                    "category": "url",
                    "severity": "medium",
                    "title": "External Hyperlink Enclosed",
                    "detail": f"Detected {len(urls_data)} external link(s). Always inspect target destinations carefully.",
                    "evidence": [u["raw_url"] for u in urls_data]
                })

        # 2. Check Credential Patterns
        for pattern, title, detail, weight, severity in self.credential_patterns:
            matches = pattern.findall(message)
            if matches:
                accumulated_score += weight
                indicators.append({
                    "id": f"cred_{title.lower().replace(' ', '_')}",
                    "category": "credentials",
                    "severity": severity,
                    "title": title,
                    "detail": detail,
                    "evidence": list(set([m[0] if isinstance(m, tuple) else m for m in matches]))
                })

        # 3. Check Urgency / Intimidation Patterns
        for pattern, title, detail, weight, severity in self.urgency_patterns:
            matches = pattern.findall(message)
            if matches:
                accumulated_score += weight
                indicators.append({
                    "id": f"urgency_{title.lower().replace(' ', '_')}",
                    "category": "urgency",
                    "severity": severity,
                    "title": title,
                    "detail": detail,
                    "evidence": list(set([m[0] if isinstance(m, tuple) else m for m in matches]))
                })

        # 4. Check Financial Patterns
        for pattern, title, detail, weight, severity in self.financial_patterns:
            matches = pattern.findall(message)
            if matches:
                accumulated_score += weight
                indicators.append({
                    "id": f"fin_{title.lower().replace(' ', '_')}",
                    "category": "financial",
                    "severity": severity,
                    "title": title,
                    "detail": detail,
                    "evidence": list(set([m[0] if isinstance(m, tuple) else m for m in matches]))
                })

        # 5. Channel-Specific Checks
        if message_type.upper() == "SMS":
            for pattern, title, detail, weight, severity in self.sms_delivery_patterns:
                matches = pattern.findall(message)
                if matches:
                    accumulated_score += weight
                    indicators.append({
                        "id": f"sms_{title.lower().replace(' ', '_')}",
                        "category": "channel",
                        "severity": severity,
                        "title": title,
                        "detail": detail,
                        "evidence": list(set([m[0] if isinstance(m, tuple) else m for m in matches]))
                    })

        # Determine Final Score & Classification
        # Score normalized between 0 and 100
        risk_score = min(100, max(0, accumulated_score))

        if risk_score >= 70:
            classification = "High Risk"
            risk_level = "high"
        elif risk_score >= 30:
            classification = "Suspicious"
            risk_level = "suspicious"
        else:
            classification = "Low Risk"
            risk_level = "low"

        # Generate Explainable Assessment Narrative
        explanation = self._build_explanation(classification, risk_score, indicators, urls_data)
        recommendations = self._build_recommendations(classification, indicators)

        return {
            "success": True,
            "detection_method": "Rule-Based Heuristic Baseline Engine (v1.2)",
            "risk_score": risk_score,
            "score_type": "Heuristic Severity Score (0-100)",
            "classification": classification,
            "risk_level": risk_level,
            "indicators": indicators,
            "urls_analyzed": urls_data,
            "explanation": explanation,
            "recommendations": recommendations,
            "ml_status": {
                "model_loaded": False,
                "note": "Baseline Heuristic Engine active. Machine Learning model slot available in backend/models/."
            }
        }

    def _build_explanation(self, classification: str, score: int, indicators: List[Dict[str, Any]], urls: List[Dict[str, Any]]) -> str:
        if classification == "High Risk":
            critical_points = [ind["title"] for ind in indicators if ind["severity"] in ["critical", "high"]]
            points_str = ", ".join(critical_points[:3]) if critical_points else "multiple compound risk factors"
            return (
                f"This message exhibits strong characteristics commonly associated with malicious phishing or social engineering campaigns "
                f"(Severity Score: {score}/100). Key flags triggered include: {points_str}. "
                f"Legitimate organizations rarely demand urgent credential verification or payment through unsolicited electronic messages."
            )
        elif classification == "Suspicious":
            key_flags = [ind["title"] for ind in indicators[:2]]
            flags_str = " and ".join(key_flags) if key_flags else "unverified link or pressure wording"
            return (
                f"This message contains warning signs that warrant caution (Severity Score: {score}/100), including {flags_str}. "
                f"While it may be legitimate marketing or automated notifications, treat links and attached instructions skeptically."
            )
        else:
            if urls:
                return (
                    f"No prominent phishing heuristics, coercive language, or credential harvesting lures were detected "
                    f"(Severity Score: {score}/100). The message does contain {len(urls)} link(s), so verify the sender before opening unfamiliar destinations."
                )
            return (
                f"The scanned message does not match known phishing signatures, urgency triggers, or scam markers "
                f"(Severity Score: {score}/100). No suspicious indicators were identified."
            )

    def _build_recommendations(self, classification: str, indicators: List[Dict[str, Any]]) -> List[str]:
        recs = []
        if classification == "High Risk":
            recs.append("DO NOT click any links, open attachments, or reply to this message.")
            recs.append("Do not enter passwords, OTP codes, banking credentials, or personal identity details.")
            recs.append("Verify through an official, independent channel (e.g. type the known banking URL manually or call official support).")
            recs.append("Report this message as spam/phishing to your carrier (forward SMS to 7726) or email provider.")
        elif classification == "Suspicious":
            recs.append("Avoid clicking direct links; navigate to the provider's official portal directly.")
            recs.append("Cross-check the sender's address or phone number against previously known official communications.")
            recs.append("If this claims to be from a bank or service provider, inspect your account status via their official mobile app.")
        else:
            recs.append("Message appears low risk, but remain vigilant with unsolicited communications.")
            recs.append("Ensure multi-factor authentication (2FA) is enabled on all primary personal accounts.")

        return recs


class PluggableMLDetector:
    """
    Interface for integrating real trained machine learning models (e.g. TF-IDF + Classifier, BERT, etc.).
    If no trained model artifact is found on disk, reports configured: False without fabricating fake AI probabilities.
    """
    def __init__(self, model_dir: str = "models"):
        self.model_dir = model_dir
        self.is_loaded = False
        self.model = None
        self.vectorizer = None
        self._attempt_load()

    def _attempt_load(self):
        # Checks if user places a trained joblib/pickle model in backend/models/
        candidate_paths = [
            os.path.join(os.path.dirname(__file__), self.model_dir, "phishing_model.joblib"),
            os.path.join(self.model_dir, "phishing_model.joblib")
        ]
        model_path = next((p for p in candidate_paths if os.path.exists(p)), candidate_paths[0])
        if os.path.exists(model_path):
            try:
                import joblib
                loaded_pipeline = joblib.load(model_path)
                self.model = loaded_pipeline
                self.is_loaded = True
                logger.info("Custom ML model successfully loaded from %s", model_path)
            except Exception as e:
                logger.warning("Failed to load model from %s: %s", model_path, e)

    def predict(self, message: str) -> Optional[Dict[str, Any]]:
        if not self.is_loaded or self.model is None:
            return None
        try:
            proba = self.model.predict_proba([message])[0]
            phishing_prob = float(proba[1]) if len(proba) > 1 else float(proba[0])
            return {
                "ml_probability": round(phishing_prob * 100, 2),
                "model_type": type(self.model).__name__
            }
        except Exception as e:
            logger.error("Error during ML inference: %s", e)
            return None


# Primary Singleton Engine
baseline_detector = RuleBasedBaselineDetector()
ml_detector = PluggableMLDetector()


def scan_message(message: str, message_type: str = "Other") -> Dict[str, Any]:
    """
    Unified entrypoint for message threat analysis.
    Executes baseline rule detection and, if available, enriches with ML model inference.
    """
    result = baseline_detector.analyze(message, message_type)
    
    # Check if real ML model is configured
    ml_res = ml_detector.predict(message)
    if ml_res:
        result["ml_status"]["model_loaded"] = True
        result["ml_status"]["model_type"] = ml_res["model_type"]
        result["ml_probability"] = ml_res["ml_probability"]
        result["detection_method"] = f"Hybrid: Rule-Based Baseline + {ml_res['model_type']}"

    return result
