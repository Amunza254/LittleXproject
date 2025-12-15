

import:py from datetime, datetime;

# Utility function to format timestamps
can format_timestamp(timestamp: str) -> str {
    return timestamp;
}

# Utility function to validate email
can validate_email(email: str) -> bool {
    return '@' in email and '.' in email;
}

# Utility function to validate username
can validate_username(username: str) -> bool {
    return len(username) >= 3 and username.isalnum();
}

# Utility function to validate password
can validate_password(password: str) -> bool {
    return len(password) >= 6;
}