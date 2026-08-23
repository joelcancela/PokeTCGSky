#!/bin/bash
IFS=$'\r\n '
URL="https://api.pokemontcg.io/v2/cards?q=name:\""
API_KEY="X-Api-Key:replaceme-with-your-key"
ID_PARAM=" id:"

# Input: input.csv (CSV: qty, name_en, name_fr, card_id)
# Output: results.json (JSON array) with an extra colon

doCurl(){
    IFS=$'\r\n'
    URL_TO_CALL="${URL}"
    URL_TO_CALL+="$1\""
    URL_TO_CALL+="${ID_PARAM}\"$2"
    URL_TO_CALL+="\""
    QTY="$3"
    echo $URL_TO_CALL
    # Change deck and/or holo
    curl "$URL_TO_CALL" -H "$API_KEY" | jq --arg qty "$QTY" '.data[0] + {"qty": $qty|tonumber, "holo": false, "location": ""}' >> results.json
    echo "," >> results.json
}

echo "[" >> results.json
while read line
do
    IFS=":"
    attributes=(`echo $line | tr ',' ':'`)
    nb_cards="${attributes[0]}"
    card_name_en="${attributes[1]}"
    card_name_fr="${attributes[2]}"
    card_id="${attributes[3]}"
    echo "Nb of cards: $nb_cards"
    echo "CardName: $card_name_en"
    echo "CardNameFR: $card_name_fr"
    echo "CardId: $card_id"
    echo "Retrieving JSON..."
    doCurl $card_name_en $card_id $nb_cards
done < "input.csv"
echo "]" >> results.json
