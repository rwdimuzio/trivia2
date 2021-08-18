
/**
 * state of a single question
 */
export enum QUESTION_STATE {
    UNANSWERED = 0,
    SELECTED = 1,
    CORRECT = 2,
    INCORRECT = 3
};

/**
 * Overall game play state machine states
 */
export enum GAME_STATE {
    NEW_GAME = 0,
    PLAYERS = 1,
    SELECTING = 2,
    ANSWERING = 3,
    ROUND_BREAK = 4,
    GAME_OVER = 5,
    GAME_ENDED = 6
};
