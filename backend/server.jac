import:py datetime;
import:py uuid;
import:py json;

glob users = {}, posts = {}, comments = {};

obj User {
    has id: str;
    has username: str;
    has email: str;
    has password: str;
    has bio: str = "";
    has avatar: str = "";
    has friends: list = [];
    has posts_list: list = [];
    has created_at: str = "";

    can safe_dict -> dict {
        result = {};
        for key, value in self.__dict__.items() {
            if key != "password" {
                result[key] = value;
            }
        }
        return result;
    }
}

obj Post {
    has id: str;
    has author_id: str;
    has author_username: str;
    has author_avatar: str;
    has content: str;
    has image: str = "";
    has likes: list = [];
    has comments_list: list = [];
    has created_at: str = "";
    
    can to_dict -> dict {
        return {
            "id": self.id,
            "author_id": self.author_id,
            "author_username": self.author_username,
            "author_avatar": self.author_avatar,
            "content": self.content,
            "image": self.image,
            "likes": self.likes,
            "comments": self.comments_list,
            "created_at": self.created_at
        };
    }
}

obj Comment {
    has id: str;
    has post_id: str;
    has author_id: str;
    has author_username: str;
    has author_avatar: str;
    has content: str;
    has created_at: str = "";
    
    can to_dict -> dict {
        return {
            "id": self.id,
            "post_id": self.post_id,
            "author_id": self.author_id,
            "author_username": self.author_username,
            "author_avatar": self.author_avatar,
            "content": self.content,
            "created_at": self.created_at
        };
    }
}

# Walker for registering a new user
walker register {
    has username: str;
    has email: str;
    has password: str;
    has bio: str = "";
    has avatar: str = "";
    
    can execute -> dict {
        # Check if username exists
        for user_id in users {
            user = users[user_id];
            if user.username == self.username {
                return {"error": "Username already exists", "status": 400};
            }
        }
        
        # Create new user
        user_id = str(uuid.uuid4());
        new_user = User(
            id = user_id,
            username = self.username,
            email = self.email,
            password = self.password,
            bio = self.bio,
            avatar = self.avatar,
            friends = [],
            posts_list = [],
            created_at = str(datetime.datetime.now())
        );
        
        users[user_id] = new_user;
        return {"user": new_user.safe_dict(), "status": 201};
    }
}

# Walker for login
walker login {
    has username: str;
    has password: str;
    
    can execute -> dict {
        for user_id in users {
            user = users[user_id];
            if user.username == self.username and user.password == self.password {
                return {"user": user.safe_dict(), "status": 200};
            }
        }
        
        return {"error": "Invalid credentials", "status": 401};
    }
}

# Walker for getting all users
walker get_users {
    can execute -> dict {
        user_list = [];
        for user_id in users {
            user_list.append(users[user_id].safe_dict());
        }
        return {"users": user_list, "status": 200};
    }
}

# Walker for getting a specific user
walker get_user {
    has user_id: str;
    
    can execute -> dict {
        if self.user_id in users {
            return {"user": users[self.user_id].safe_dict(), "status": 200};
        }
        return {"error": "User not found", "status": 404};
    }
}

# Walker for updating user
walker update_user {
    has user_id: str;
    has bio: str = None;
    has avatar: str = None;
    has username: str = None;
    has email: str = None;
    
    can execute -> dict {
        if self.user_id not in users {
            return {"error": "User not found", "status": 404};
        }
        
        user = users[self.user_id];
        
        if self.bio is not None {
            user.bio = self.bio;
        }
        if self.avatar is not None {
            user.avatar = self.avatar;
        }
        if self.username is not None {
            user.username = self.username;
        }
        if self.email is not None {
            user.email = self.email;
        }
        
        return {"user": user.safe_dict(), "status": 200};
    }
}

# Walker for adding a friend
walker add_friend {
    has user_id: str;
    has friend_id: str;
    
    can execute -> dict {
        if self.user_id not in users or self.friend_id not in users {
            return {"error": "User not found", "status": 404};
        }
        
        if self.user_id == self.friend_id {
            return {"error": "Cannot add yourself as friend", "status": 400};
        }
        
        user = users[self.user_id];
        friend = users[self.friend_id];
        
        if self.friend_id not in user.friends {
            user.friends.append(self.friend_id);
        }
        if self.user_id not in friend.friends {
            friend.friends.append(self.user_id);
        }
        
        return {"message": "Friend added successfully", "status": 200};
    }
}

# Walker for removing a friend
walker remove_friend {
    has user_id: str;
    has friend_id: str;
    
    can execute -> dict {
        if self.user_id not in users or self.friend_id not in users {
            return {"error": "User not found", "status": 404};
        }
        
        user = users[self.user_id];
        friend = users[self.friend_id];
        
        if self.friend_id in user.friends {
            user.friends.remove(self.friend_id);
        }
        if self.user_id in friend.friends {
            friend.friends.remove(self.user_id);
        }
        
        return {"message": "Friend removed successfully", "status": 200};
    }
}

# Walker for creating a post
walker create_post {
    has author_id: str;
    has content: str;
    has image: str = "";
    
    can execute -> dict {
        if self.author_id not in users {
            return {"error": "User not found", "status": 404};
        }
        
        author = users[self.author_id];
        post_id = str(uuid.uuid4());
        
        new_post = Post(
            id = post_id,
            author_id = self.author_id,
            author_username = author.username,
            author_avatar = author.avatar,
            content = self.content,
            image = self.image,
            likes = [],
            comments_list = [],
            created_at = str(datetime.datetime.now())
        );
        
        posts[post_id] = new_post;
        author.posts_list.append(post_id);
        
        return {"post": new_post.to_dict(), "status": 201};
    }
}

# Walker for getting all posts
walker get_posts {
    can execute -> dict {
        post_list = [];
        for post_id in posts {
            post = posts[post_id];
            post_list.append(post.to_dict());
        }
        
        # Sort by created_at (newest first)
        post_list.sort(key=lambda x: x["created_at"], reverse=True);
        return {"posts": post_list, "status": 200};
    }
}

# Walker for getting a specific post
walker get_post {
    has post_id: str;
    
    can execute -> dict {
        if self.post_id in posts {
            post = posts[self.post_id];
            return {"post": post.to_dict(), "status": 200};
        }
        return {"error": "Post not found", "status": 404};
    }
}

# Walker for deleting a post
walker delete_post {
    has post_id: str;
    
    can execute -> dict {
        if self.post_id not in posts {
            return {"error": "Post not found", "status": 404};
        }
        
        post = posts[self.post_id];
        author_id = post.author_id;
        
        # Remove post from author's posts_list
        if author_id in users {
            author = users[author_id];
            if self.post_id in author.posts_list {
                author.posts_list.remove(self.post_id);
            }
        }
        
        # Remove all comments for this post
        for comment_id in post.comments_list {
            if comment_id in comments {
                del comments[comment_id];
            }
        }
        
        # Remove the post
        del posts[self.post_id];
        
        return {"message": "Post deleted successfully", "status": 200};
    }
}

# Walker for liking/unliking a post
walker like_post {
    has post_id: str;
    has user_id: str;
    
    can execute -> dict {
        if self.post_id not in posts {
            return {"error": "Post not found", "status": 404};
        }
        
        if self.user_id not in users {
            return {"error": "User not found", "status": 404};
        }
        
        post = posts[self.post_id];
        
        if self.user_id in post.likes {
            post.likes.remove(self.user_id);
        } else {
            post.likes.append(self.user_id);
        }
        
        return {"post": post.to_dict(), "status": 200};
    }
}

# Walker for adding a comment
walker add_comment {
    has post_id: str;
    has author_id: str;
    has content: str;
    
    can execute -> dict {
        if self.post_id not in posts {
            return {"error": "Post not found", "status": 404};
        }
        
        if self.author_id not in users {
            return {"error": "User not found", "status": 404};
        }
        
        author = users[self.author_id];
        comment_id = str(uuid.uuid4());
        
        new_comment = Comment(
            id = comment_id,
            post_id = self.post_id,
            author_id = self.author_id,
            author_username = author.username,
            author_avatar = author.avatar,
            content = self.content,
            created_at = str(datetime.datetime.now())
        );
        
        comments[comment_id] = new_comment;
        posts[self.post_id].comments_list.append(comment_id);
        
        return {"comment": new_comment.to_dict(), "status": 201};
    }
}

# Walker for getting comments on a post
walker get_comments {
    has post_id: str;
    
    can execute -> dict {
        if self.post_id not in posts {
            return {"error": "Post not found", "status": 404};
        }
        
        post = posts[self.post_id];
        comment_list = [];
        
        for comment_id in post.comments_list {
            if comment_id in comments {
                comment = comments[comment_id];
                comment_list.append(comment.to_dict());
            }
        }
        
        return {"comments": comment_list, "status": 200};
    }
}

# Walker for getting user's feed
walker get_feed {
    has user_id: str;
    
    can execute -> dict {
        if self.user_id not in users {
            return {"error": "User not found", "status": 404};
        }
        
        user = users[self.user_id];
        feed = [];
        
        for post_id in posts {
            post = posts[post_id];
            
            # Include user's own posts and friends' posts
            if post.author_id == self.user_id or post.author_id in user.friends {
                post_dict = post.to_dict();
                post_dict["comment_details"] = [];
                
                # Add comment details
                for comment_id in post.comments_list {
                    if comment_id in comments {
                        comment = comments[comment_id];
                        post_dict["comment_details"].append(comment.to_dict());
                    }
                }
                
                feed.append(post_dict);
            }
        }
        
        # Sort by created_at (newest first)
        feed.sort(key=lambda x: x["created_at"], reverse=True);
        return {"feed": feed, "status": 200};
    }
}

# Walker for health check
walker health_check {
    can execute -> dict {
        return {
            "status": "healthy",
            "users": len(users),
            "posts": len(posts),
            "comments": len(comments),
            "timestamp": str(datetime.datetime.now())
        };
    }
}

with entry {
    print("🚀 SocialBook Backend Server (Pure Jac) Loaded!");
    print("Available walkers:");
    print("  - register: Register a new user");
    print("  - login: Login a user");
    print("  - get_users: Get all users");
    print("  - get_user: Get a specific user");
    print("  - update_user: Update user profile");
    print("  - add_friend: Add a friend");
    print("  - remove_friend: Remove a friend");
    print("  - create_post: Create a new post");
    print("  - get_posts: Get all posts");
    print("  - get_post: Get a specific post");
    print("  - delete_post: Delete a post");
    print("  - like_post: Like/unlike a post");
    print("  - add_comment: Add a comment");
    print("  - get_comments: Get comments on a post");
    print("  - get_feed: Get user's personalized feed");
    print("  - health_check: Check system health");
}