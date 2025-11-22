// Live reload for development (only attempts connection, silently fails if not available)
(function () {
    try {
        const ws = new WebSocket("ws://localhost:35729");
        
        ws.onmessage = function (event) {
            if (event.data === "reload") {
                console.log("Reloading page...");
                location.reload();
            }
        };
        
        ws.onopen = function () {
            console.log("Live reload connected");
        };
        
        ws.onerror = function () {
            // Silently ignore - live reload server not running
        };
    } catch (e) {
        // Silently ignore - live reload not available
    }
})();
