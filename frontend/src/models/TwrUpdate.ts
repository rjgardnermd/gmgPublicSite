export interface HprResult {
    start_ts: string;
    end_ts: string;
    start_val: number;
    hpr: number;
    profit_by_symbol: Record<string, number>;
    hpr_by_symbol: Record<string, number>;
}

export interface TwrUpdateData {
    hpr_results: HprResult[];
    twr: number;
    twr_contribution_by_symbol: Record<string, number>;
}

export interface TwrUpdateMessage {
    type: string;
    channel: string;
    message: TwrUpdateData;
}
