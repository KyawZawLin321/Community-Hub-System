package com.ojt12.cybersquad.dto;


// kym //

public class VoteRequestDTO {

        private int optionId;
        private int pollId;
        private int userId;

        // Constructor, getters, and setters

        public VoteRequestDTO() {
        }

        public VoteRequestDTO(int optionId, int pollId, int userId) {
            this.optionId = optionId;
            this.pollId = pollId;
            this.userId = userId;
        }

        public int getOptionId() {
            return optionId;
        }

        public void setOptionId(int optionId) {
            this.optionId = optionId;
        }

        public int getPollId() {
            return pollId;
        }

        public void setPollId(int pollId) {
            this.pollId = pollId;
        }

        public int getUserId() {
            return userId;
        }

        public void setUserId(int userId) {
            this.userId = userId;
        }
}

// kym //