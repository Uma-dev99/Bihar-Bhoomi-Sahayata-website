"""Rate limits for the public enquiry form.

Two limits apply per visitor IP address:
  * burst:     a few submissions per minute (stops rapid-fire scripts)
  * sustained: a modest number per day (stops slow, repeated abuse)
Rates are set in settings.REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"] and can be
changed with the ENQUIRY_RATE_BURST / ENQUIRY_RATE_SUSTAINED variables.
"""

from rest_framework.throttling import AnonRateThrottle


class EnquiryBurstThrottle(AnonRateThrottle):
    scope = "enquiry_burst"


class EnquirySustainedThrottle(AnonRateThrottle):
    scope = "enquiry_sustained"
