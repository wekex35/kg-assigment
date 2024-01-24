
function printProgress(progress) {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write("Progress " + (progress * 100).toFixed(0) + '% ');
}

function printDataProgress(progress) {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write("Please wait, No of Insert batch in queue: " + progress);
}

module.exports = {printProgress, printDataProgress};
