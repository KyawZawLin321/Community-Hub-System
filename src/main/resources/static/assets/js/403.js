document.addEventListener("DOMContentLoaded", function() {
    const divElement = document.getElementById('loading-div');
    if (divElement) {
        const str = divElement.innerHTML.toString();
        let i = 0;
        divElement.innerHTML = "";

        setTimeout(function() {
            const se = setInterval(function() {
                i++;
                divElement.innerHTML = str.slice(0, i) + "|";
                if (i == str.length) {
                    clearInterval(se);
                    divElement.innerHTML = str;
                }
            }, 10);
        }, 0);
    } else {
        console.error("No element with id 'loading-div' found.");
    }
});