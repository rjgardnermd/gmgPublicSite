export enum SubscriptionAction {
    SUBSCRIBE = "subscribe",
    UNSUBSCRIBE = "unsubscribe"
}

export class SubscriptionDto {
    constructor(
        public action: SubscriptionAction,
        public channels: string[]
    ) { }

    toStr(): string {
        return JSON.stringify({
            action: this.action,
            channels: this.channels
        });
    }
}
