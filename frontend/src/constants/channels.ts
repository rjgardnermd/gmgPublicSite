export const ConsumerChannels = {
    TwrUpdate: "Consumer.TwrUpdate",
    TickerUpdate: "Consumer.TickerUpdate",
    OrderUpdate: "Consumer.OrderUpdate",
    AccountUpdate: "Consumer.AccountUpdate",
    PositionUpdate: "Consumer.PositionUpdate",
    PriceNotification: "Consumer.PriceNotification",
    OrderNotification: "Consumer.OrderNotification",
    PortfolioUpdate: "Consumer.PortfolioUpdate"
} as const;

export const SystemChannels = {
    Error: "System.Error",
    HealthCheck: "System.HealthCheck"
} as const;

export type ConsumerChannel = typeof ConsumerChannels[keyof typeof ConsumerChannels];
export type SystemChannel = typeof SystemChannels[keyof typeof SystemChannels];
