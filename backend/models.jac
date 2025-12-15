"""
Data Models for SocialBook Application
Defines User, Post, and Comment structures
"""

node User {
    has id: str;
    has username: str;
    has email: str;
    has password: str;
    has bio: str = "";
    has avatar: str = "";
    has friends: list = [];
    has posts: list = [];
    has created_at: str;
}

node Post {
    has id: str;
    has author_id: str;
    has author_username: str;
    has author_avatar: str = "";
    has content: str;
    has image: str = "";
    has likes: list = [];
    has comments: list = [];
    has created_at: str;
}

node Comment {
    has id: str;
    has post_id: str;
    has author_id: str;
    has author_username: str;
    has author_avatar: str = "";
    has content: str;
    has created_at: str;
}