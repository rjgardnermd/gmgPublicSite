
export function logModel(model: object, label = "Model"): void {
    console.log(`${label}:`);
    for (const [key, value] of Object.entries(model)) {
        console.log(`  ${key}: ${value}`);
    }
}