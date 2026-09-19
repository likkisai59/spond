"""MongoDB collection names (never hardcode elsewhere)."""
USERS = "users"
ROLES = "roles"
REFRESH_TOKENS = "refresh_tokens"
AUDIT_LOGS = "audit_logs"
OTPS = "otps"

# Sports Module Collections
SPORTS_GROUPS = "sports_groups"
SPORTS_GROUP_MEMBERS = "sports_group_members"
SPORTS_EVENTS = "sports_events"
SPORTS_RSVPS = "sports_rsvps"
SPORTS_ATTENDANCE = "sports_attendance"
SPORTS_VENUES = "sports_venues"
SPORTS_VENUE_SLOTS = "sports_venue_slots"
SPORTS_BOOKINGS = "sports_bookings"
SPORTS_PAYMENT_REQUESTS = "sports_payment_requests"
# Messages Module Collections
CONVERSATIONS = "conversations"
MESSAGES = "messages"

# Band & EventHub Module Collections
BAND_ARTISTS = "artists"
BAND_BANDS = "bands"
BAND_VENUES = "band_venues"
BAND_BOOKINGS = "band_bookings"
BAND_VENUE_BOOKINGS = "band_venue_bookings"
EVENTHUB_EVENTS = "eventhub_events"

# System/Cross-Module Collections (Phase 4)
PAYMENTS = "payments"
TRANSACTIONS = "transactions"
PAYMENT_RECEIPTS = "payment_receipts"
FILES = "files"
FOLDERS = "folders"
NOTIFICATIONS = "notifications"
NOTIFICATION_LOGS = "notification_logs"

# Phase 5 Collections (Matches & Analytics)
SPORTS_MATCHES = "sports_matches"
SPORTS_MATCH_SUMMARY = "sports_match_summary"
SPORTS_PLAYER_STATS = "sports_player_stats"

BAND_ARTIST_ANALYTICS = "band_artist_analytics"
BAND_VENUE_ANALYTICS = "band_venue_analytics"
BAND_DASHBOARD_ANALYTICS = "band_dashboard_analytics"
