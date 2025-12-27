// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function logStack(error: any) {
    if (error.response) {
        // Server responded with a status other than 2xx
        console.log(`Response data: ${error.response.data}`)
        console.log(`Response status: ${error.response.status}`)
        console.log(`Response headers: ${error.response.headers}`)
    } else if (error.request) {
        // Request was sent but no response received
        console.log(`Request data: ${error.request}`)
    } else {
        // Something else went wrong
        console.log(`Error message: ${error.message}`)
    }
}
