import { watchEffect } from "vue"

export const asyncWatchEffect = (callback: () => Promise<void>) => {
    let state: "idle" | "running" | "pending" | "stopped" = "idle"

    let resolveFirstRun!: () => void
    const firstRun = new Promise<void>((resolve) => (resolveFirstRun = resolve))

    const run = async () => {
        if (state === "stopped") return
        if (state === "running") return (state = "pending")

        state = "running"
        await callback()
        resolveFirstRun()

        if ((state as string) === "stopped") return
        if ((state as string) === "pending") {
            state = "idle"
            return void run()
        }

        state = "idle"
    }

    const stopWatch = watchEffect(() => void run())
    return {
        firstRun,
        stop() {
            if (state === "stopped") return

            state = "stopped"
            stopWatch()
        },
    }
}
