import React, { Component } from "react";
import { HiRefresh } from "react-icons/hi";
import { CircularProgress, TextareaAutosize } from "@mui/material";
import Button from "../components/Button";

export default class MessageInput extends Component {
    constructor(props) {
        super(props);

        this.onChangeQuery = this.onChangeQuery.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onSubmitInput = this.onSubmitInput.bind(this);

        this.textAreaRef = React.createRef(null);
        this.state = { query: "" }
    }

    /* Event Handlers */

    onChangeQuery(event) {
        this.setState({ query: event.target.value });
    }

    onKeyDown(event) {
        const { onSubmitMessage, isBlocked } = this.props;
        const { query } = this.state;

        if (event.key === "Enter" && !event.shiftKey && query !== "" && !isBlocked) {
            event.preventDefault();
            onSubmitMessage(event.target.value);
            this.setState({ query: "" });
        }
    }

    onSubmitInput() {
        const { onSubmitMessage, isBlocked } = this.props;
        const { query } = this.state;

        if (query !== "" && !isBlocked) {
            onSubmitMessage(query);
            this.setState({ query: "" });
        }
    }

    /* Lifecycle Methods */

    render() {
        const { onClearConversation, isBlocked } = this.props;
        const { query } = this.state;

        return (
            <div className="ext-chatbotInputContainer">
                <form className="ext-chatForm" onSubmit={this.onSubmitInput}>
                    <div className="ext-chatInputContainer">
                        <TextareaAutosize
                            ref={this.textAreaRef}
                            minRows={1}
                            maxRows={10}
                            className="ext-chatTextarea"
                            value={query}
                            onChange={this.onChangeQuery}
                            placeholder="Ask a question..."
                            onKeyDown={this.onKeyDown}
                        />
                        <Button
                            className="ext-chatSubmitButton"
                            isPrimary
                            type="submit"
                            onClick={this.onSubmitInput}
                        >
                            {isBlocked ? (
                                <CircularProgress
                                    variant="indeterminate"
                                    size="17px"
                                    sx={{color:"#DBE2F0"}} 
                                />
                            ) : "Ask AI"}
                        </Button>
                    </div>
                </form>
                <div className="ext-chatbotOptions" onClick={onClearConversation}>
                    <HiRefresh size={16} />
                    <span>Clear conversation</span>
                </div>
            </div>
        );
    }
}