// ==UserScript==
// @name         Snap Zone Plus
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Enhance Snap Zone experience.
// @author       @FluffyAdelyne
// @match        https://marvelsnapzone.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=marvelsnapzone.com
// @grant        GM_addStyle
// ==/UserScript==

GM_addStyle ( `
    .refresh_button {
        background-color: var(--buttonInitialColor);
        color: var(--buttonTextInitialColor);
        border-radius: var(--buttonBorderRadius, 3px);
        padding: var(--button-padding);
    }

    .card_overlay {
        position: absolute;
        width: 150px;
        color: white;
        background-color: rgba(0, 0, 0, 0.7);
        z-index: 4;
        font-size: 12px;
        text-align: center;
        margin-top: 15px;
        white-space: pre-line;
    }
    .card_overlay_head{
        font-size: 13px;
        font-weight: bold;
        display: flex;
        gap: 2px;
        justify-content: center;
    }
    .circle_overlay {
        color: white;
        border-radius: 100%;
        width: 18px;
        height: 18px;
    }
    .square_overlay {
        color: white;
        width: 18px;
        height: 18px;
    }
` );
Object.defineProperty(String.prototype, 'capitalize', {
  value: function() {
    return this.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
;
  },
  enumerable: false
});

function removeInfos(){
    var overlays = document.querySelectorAll('.card_overlay');
    Array.prototype.forEach.call( overlays, function( node ) {
        node.parentNode.removeChild( node );
    });
}

function updateCardsDict(){
    if (window.location.href == "https://marvelsnapzone.com/cards/") {
        console.log("SZ+ | Collecting cards infos.");
        let cardsDict = {};
        for (let card of document.querySelectorAll('[data-ability]')) {
            cardsDict[card.dataset.name] = card.dataset;
        }
        window.localStorage.setItem("cardsDict", JSON.stringify(cardsDict));
    }
}
function updateCollection(){
    if (window.location.href == "https://marvelsnapzone.com/collection/") {
        console.log("SZ+ | Collecting collection infos.");
        let collection = [];
        for (let card of document.querySelectorAll('[data-ability]')) {
            if(card.classList.contains("collected")){
                collection.push(parseInt(card.dataset.cid));
            }
        }
        window.localStorage.setItem("collection", JSON.stringify(collection));
    }
}


function updateInfos(sourceDict){
    let cardsDict = JSON.parse(window.localStorage.getItem("cardsDict"));
    let collection = JSON.parse(window.localStorage.getItem("collection"));
    console.log("SZ+ | Start showing infos.");
    for (let card of document.querySelectorAll('[data-name]')) {
        if (card.getElementsByTagName('img').length > 0) {
            let cardName = card.dataset.name.toLowerCase();
            let cardDict = cardsDict[cardName];
            if (cardDict != undefined){
                let cardAbility = cardDict.ability;
                if (cardAbility == "") {
                    cardAbility = "No ability";
                }
                let cardOverlay = document.createElement('div');
                cardOverlay.classList.add('card_overlay');
                let overHead = document.createElement('div');
                let acquired = "";
                if (collection != undefined){
                    if (collection.includes(parseInt(cardDict.cid))){
                        overHead.style.color = "Chartreuse";
                    } else {
                        overHead.style.color = "red";
                    }
                };
                overHead.classList.add('card_overlay_head');
                let cardCost = document.createElement('div');
                cardCost.classList.add('circle_overlay');
                cardCost.style.backgroundColor = "blue";
                cardCost.innerHTML = cardDict.cost
                let cardPower = document.createElement('div');
                cardPower.classList.add('circle_overlay');
                cardPower.style.backgroundColor = "chocolate";
                cardPower.innerHTML = cardDict.power;
                overHead.innerHTML = cardDict.name.capitalize() + " ";
                overHead.append(cardCost);
                overHead.append(cardPower);
                for (const [key, value] of Object.entries(sourceDict)) {
                    if (cardDict.source.includes(key)){
                        let cardPool = document.createElement('div');
                        cardPool.classList.add('square_overlay');
                        cardPool.style.backgroundColor = "darkgreen";
                        cardPool.innerHTML = value;
                        overHead.append(cardPool);
                        break;
                    }
                }
                let cardAbidiv = document.createElement('div');
                cardAbidiv.innerHTML = cardAbility;
                cardOverlay.append(overHead);
                cardOverlay.append(cardAbidiv);
                card.insertBefore(cardOverlay, card.firstChild);
            }
        }
    }
    console.log("SZ+ | All infos shown.");
}


(function() {
    'use strict';
    const sourceDict = {
        "Starter": "0",
        "Recruit": "0",
        "Level 1-": "0",
        "Pool 1": "1",
        "Pool 2": "2",
        "Pool 3": "3",
        "Pool 4": "4",
        "Pool 5": "5",
        "Season Pass": "S",
        "Not Available": "✖",
    };
    console.log("SZ+ | Script start.");
    let cardsURL = "https://marvelsnapzone.com/cards/";
    if (window.localStorage.cardsDict === undefined && window.location.href != cardsURL) {
        window.location.href = cardsURL;
    }
    window.addEventListener('load', (event) => {
        updateInfos(sourceDict);
        var btn = document.createElement('button');
        btn.classList.add('refresh_button');
        btn.textContent = "↻ SZ +";
        btn.addEventListener('click', function(){
           removeInfos();
           updateInfos(sourceDict);
        });

        var btn2 = document.createElement('button');
        btn2.classList.add('refresh_button');
        btn2.textContent = "↻ Cards";
        btn2.addEventListener('click', function(){
            updateCardsDict();
            updateCollection();            
        });
        var end_items = document.querySelector("#header .ct-container-fluid [data-column=end] [data-items=primary]");
        end_items.insertBefore(btn2, end_items.firstChild);
        end_items.insertBefore(btn, btn2);
    });
})();
