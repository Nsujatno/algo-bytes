export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Challenge {
    id: string;
    title: string;
    description: string;
    difficulty: Difficulty;
    algorithm_category: string;
    game_type: 'code_assembler';
    challenge_data: ChallengeData;
    is_daily: boolean;
    daily_date: string | null;
    created_at: string;
    completed?: boolean;
}

export interface ChallengeData {
    problem_statement: string;
    input_example: string | string[];
    output_example: string | string[];
    constraints: string[];
    hints: string[];
    visual_input?: VisualInput;
    total_slots: number;
    code_blocks: CodeBlock[];
    decoy_blocks: CodeBlock[];
}

export interface VisualInput {
    type: 'linked_list' | 'array' | 'string';
    values: any[];
}

export interface CodeBlock {
    id: string;
    code: string;
    correct_position?: number;
    indentation: number;
    is_boilerplate?: boolean;
}
// DecoyBlock is now redundant if we usage CodeBlock with undefined correct_position


export interface UserProgress {
    id: string;
    user_id: string;
    challenge_id: string;
    completed: boolean;
    time_taken: number | null;
    completed_at: string;
}
