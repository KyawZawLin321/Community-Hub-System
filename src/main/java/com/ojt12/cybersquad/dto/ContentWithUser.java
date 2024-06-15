package com.ojt12.cybersquad.dto;

import com.ojt12.cybersquad.model.Content;
import com.ojt12.cybersquad.model.User;

public class ContentWithUser {
        private Content content;
        private User user;

        public ContentWithUser(Content content, User user) {
            this.content = content;
            this.user = user;
        }

        public Content getContent() {
            return content;
        }

        public void setContent(Content content) {
            this.content = content;
        }

        public User getUser() {
            return user;
        }

        public void setUser(User user) {
            this.user = user;
        }
}
