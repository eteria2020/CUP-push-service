function getStringDay(day) {
    var weekday = [];
    weekday[0] = "Domenica";
    weekday[1] = "Lunedì";
    weekday[2] = "Martedì";
    weekday[3] = "Mercoledì";
    weekday[4] = "Giovedì";
    weekday[5] = "Venerdì";
    weekday[6] = "Sabato";


    return weekday[day];
}

function getStringMonth(mon) {
    var month = [];
    month[0] = "Gennaio";
    month[1] = "Febbraio";
    month[2] = "Marzo";
    month[3] = "Aprile";
    month[4] = "Maggio";
    month[5] = "Giugno";
    month[6] = "Luglio";
    month[7] = "Agosto";
    month[8] = "Settembre";
    month[9] = "Ottobre";
    month[10] = "Novembre";
    month[11] = "Dicembre";
    return month[mon];
}

function addZero(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}

module.exports = {
    getDataIta: function (UTC) {
        var dataEn = new Date(UTC);
        return getStringDay(dataEn.getUTCDay()) + " " + addZero(dataEn.getUTCDate()) + "-" + getStringMonth(dataEn.getUTCMonth()) + "-" + dataEn.getFullYear() + " alle " + addZero(dataEn.getHours()) + ":" + addZero(dataEn.getMinutes());
    },
    getDataForTimestampItaCloseTrip: function (timestamp) {
        var dataEn = new Date(timestamp);
        return getStringDay(dataEn.getUTCDay()) + " " + addZero(dataEn.getUTCDate()) + "-" + getStringMonth(dataEn.getUTCMonth()) + "-" + dataEn.getFullYear() + " alle " + addZero(dataEn.getUTCHours()) + ":" + addZero(dataEn.getUTCMinutes());
    }
};