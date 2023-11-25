let inCount = 1;
let outCount = 1;
let tgt = '';
let timeoutId = '';
let copyRow = '';
document.querySelectorAll('input[name="inProtocol"]').forEach((elem) => {
    elem.addEventListener("change", function (event) {
        var item = event.target.value;
        if (item === 'HTTP')
            document.getElementById('inPort').value = 80;
        else if (item === 'HTTPS')
            document.getElementById('inPort').value = 443;
    });
});

document.querySelectorAll('input[name="outProtocol"]').forEach((elem) => {
    elem.addEventListener("change", function (event) {
        var item = event.target.value;
        if (item === 'HTTP')
            document.getElementById('outPort').value = 80;
        else if (item === 'HTTPS')
            document.getElementById('outPort').value = 443;
    });
});

function addHost(event) {

    const urlPattern = /^[a-zA-Z0-9.-]+\.[a-z]+$/; // Pattern for a domain name without protocol

    if(event.target.id === 'inButton') {
        tgt = 'in';
        count = inCount;
    }
    else if(event.target.id === 'outButton') {
        tgt = 'out';
        count = outCount;
    }

    const host = document.getElementById(tgt+'Host').value;
    const port = document.getElementById(tgt+'Port').value;
    const protocols = document.getElementsByName(tgt+'Protocol');
    let protocol = '';

    if (!(urlPattern.test(host))) {
        alertMessage('Invalid Host');
        return;
    }

    if((port === '') || !(port >= 0 && port <= 65535)) {
        alertMessage('Invalid Port');
        return;
    }
    else {
        if(port === '443') {
            protocol = 'HTTPS';
        }
        else {
            protocol = 'HTTP';
        }
    }

    // check if record exists
    let flag = 0;
    for(i=1; i < inCount; i++) {
        const row = document.getElementById('in'+i);
        if((host === row.getElementsByTagName('td')[1].innerHTML) && (port === row.getElementsByTagName('td')[2].innerHTML)) {
            flag = 1;
            break;
        }
    }
    for(i=1; i < outCount; i++) {
        const row = document.getElementById('out'+i);
        if((host === row.getElementsByTagName('td')[1].innerHTML) && (port === row.getElementsByTagName('td')[2].innerHTML)) {
            flag = 1;
            break;
        }
    }
    if(flag === 1) {
        alertMessage('Record already exists!');
        document.getElementById(tgt+'Form').reset();
        return;
    }

    // Find a <table> element with id="inHosts":
    var table = document.getElementById(tgt+'Hosts');

    // Create an empty <tr> element and add it to the 1st position of the table:
    var row = table.insertRow(count);
    if(tgt === 'in') {
        row.id = 'in'+inCount;
        inCount++;
    }
    else if(tgt === 'out') {
        row.id = 'out'+outCount;
        outCount++;
    }

    // Apply styles to the new row to match the design
    row.classList.add("table-row"); // Add a class for styling

    // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    var cell4 = row.insertCell(3);
    var cell5 = row.insertCell(4);

    // Add some text to the new cells:
    cell1.innerHTML = count;
    cell2.innerHTML = host;
    cell2.title = host;
    cell2.addEventListener("mouseover", function () {
        const roww = this.parentNode;
        copyRow = roww.innerHTML;
        roww.innerHTML = '<td id="completeHost" colspan=5 onmouseleave=rowReset()>'+roww.getElementsByTagName('td')[1].innerHTML+'</td>';
    })
    cell3.innerHTML = port;
    cell4.innerHTML = protocol;
    cell5.innerHTML = '<button id=Del'+tgt+((tgt === "in") ? inCount-1 : outCount-1)+' onclick=removeHost(event) type="button">X</button>';
    document.getElementById(tgt+'Form').reset();

    if(tgt === 'in') {
        document.getElementById('inNoRecords').style.display = 'none';
    }
    else if(tgt === 'out') {
        document.getElementById('outNoRecords').style.display = 'none';
    }
}

function rowReset() {
    const roww = document.getElementById('completeHost').parentNode;
    roww.innerHTML = copyRow;
    setTimeout(() => { roww.getElementsByTagName('td')[1].addEventListener("mouseover", function () {
            const roww = this.parentNode;
            copyRow = roww.innerHTML;
            roww.innerHTML = '<td id="completeHost" colspan=5 onmouseleave=rowReset()>'+roww.getElementsByTagName('td')[1].innerHTML+'</td>';
        })
    }, 100);
}

function removeHost(event) {
    if(event.target.id.slice(3,5) === 'in') {
        tgt = 'in';
    }
    else if(event.target.id.slice(3,6) === 'out') {
        tgt = 'out';
    }
    var table = document.getElementById(tgt+'Hosts');
    var rowNumberToDelete = event.target.id.slice((tgt === 'in')? 5 : 6);
    table.deleteRow(rowNumberToDelete);
    (tgt === 'in')? inCount-- : outCount--;

    for(i = parseInt(rowNumberToDelete) + 1; i <= ((tgt === 'in')? inCount : outCount); i++) {
        row = document.getElementById(tgt+i);
        rowNumber = row.id.slice((tgt === 'in')? 2 : 3);
        row.getElementsByTagName('td')[0].innerHTML = rowNumber-1;
        deleteButton = document.getElementById('Del'+tgt+rowNumber);
        deleteButton.id = 'Del'+tgt+(parseInt(rowNumber)-1);
        row.id = tgt+(rowNumber-1);
    }

    if(inCount === 1) {
        document.getElementById('inNoRecords').style.display = 'block';
    }
    if(outCount === 1) {
        document.getElementById('outNoRecords').style.display = 'block';
    }
}

async function burpify() {
    obj = {
        "target": {
            "scope": {
                "advanced_mode": true,
                "exclude": [],
                "include": []
            }
        }
    };
    oneHost = {
        "enabled": true,
        "file": "^/.*",
        "host": "",
        "port": "",
        "protocol": ""
    };
    rowNumber = 1;
    row = document.getElementById('in'+rowNumber);
    for (; row !== null;) {
        cells = row.getElementsByTagName('td');
        oneHost.host = "^" + cells[1].innerHTML + "$";
        oneHost.port = "^" + cells[2].innerHTML + "$";
        oneHost.protocol = cells[3].innerHTML;
        obj.target.scope.include[rowNumber - 1] = {...oneHost};
        rowNumber++;
        row = document.getElementById('in'+rowNumber);
    }
    rowNumber = 1;
    row = document.getElementById('out'+rowNumber);
    for (; row !== null;) {
        cells = row.getElementsByTagName('td');
        oneHost.host = "^" + cells[1].innerHTML + "$";
        oneHost.port = "^" + cells[2].innerHTML + "$";
        oneHost.protocol = cells[3].innerHTML;
        obj.target.scope.exclude[rowNumber - 1] = {...oneHost};
        rowNumber++;
        row = document.getElementById('out'+rowNumber);
    }

    const filePath = await electron.saveFile(obj);
    if(filePath) {
        alertMessage("File generated");
    }
}

function resetState() {
    document.getElementById('inForm').reset();
    document.getElementById('outForm').reset();
    if(inCount > 1) {
        for(i = inCount-1; i > 0; i--) {
            document.getElementById('inHosts').deleteRow(i);
        }
        inCount = 1;
    }
    if(outCount > 1) {
        for(i = outCount-1; i > 0; i--) {
            document.getElementById('outHosts').deleteRow(i);
        }
        outCount = 1;
    }
    document.getElementById('inNoRecords').style.display = 'block';
    document.getElementById('outNoRecords').style.display = 'block';
}

function alertMessage(message) {
    
    clearTimeout(timeoutId);
    const container = document.getElementById('custom-toast-container');
    container.innerHTML = '';

    // Create a new toast element
    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    toast.textContent = message;

    if(message === 'File generated') {
        toast.style.background = '#4CAF50';
    }

    // Append the toast to the container
    container.appendChild(toast);

    // Automatically remove the toast after a certain duration (adjust as needed)
    timeoutId = setTimeout(() => {
        container.innerHTML = '';
    }, 3000); // 3000 milliseconds (adjust as needed)
    
}

// JavaScript for smooth button animations
const buttons = document.querySelectorAll("button");

buttons.forEach(button => {
    button.addEventListener("mouseenter", function () {
        this.style.transform = "scale(1.05)";
    });

    button.addEventListener("mouseleave", function () {
        this.style.transform = "scale(1)";
    });
});

// JavaScript for emphasizing the "Burpify" button
const burpifyButton = document.getElementById("burpify");

burpifyButton.addEventListener("mouseenter", function () {
    this.style.transform = "scale(1.1)";
});

burpifyButton.addEventListener("mouseleave", function () {
    this.style.transform = "scale(1)";
});

document.getElementById('inButton').addEventListener('click', (event) => {
    addHost(event);
});

document.getElementById('outButton').addEventListener('click', (event) => {
    addHost(event);
});

document.getElementById('burpify').addEventListener('click', () => {
    burpify();
});

document.getElementById('reset').addEventListener('click', () => {
    resetState();
});
