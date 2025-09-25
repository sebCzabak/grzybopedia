from flask import Flask, request, jsonify
from flask_cors import CORS
from flasgger import Swagger  # <-- Swagger import
import io

# Importujemy funkcję z Twojego skryptu z modelem
from model_runner import predict_mushroom

# Inicjalizacja aplikacji Flask
app = Flask(__name__)

# Dodaj Swagger
swagger = Swagger(app)

# Konfiguracja CORS, aby zezwolić na zapytania na czas developmentu
# Zezwoli to na połączenia zarówno z `localhost`, jak i z `ngrok`
CORS(app)


@app.route("/recognize", methods=["POST"])
def recognize_mushroom():
    """
    Główny endpoint API, który przyjmuje obraz, analizuje go
    i zwraca wynik w formacie JSON.
    ---
    consumes:
      - multipart/form-data
    parameters:
      - name: image
        in: formData
        type: file
        required: true
        description: Obraz grzyba do rozpoznania
    responses:
      200:
        description: Sukces — model zwraca najlepsze dopasowanie
        examples:
          application/json:
            id: "temp-id"
            name: "Borowik szlachetny"
            latinName: "Boletus edulis"
            isEdible: true
            description: "Model rozpoznał ten gatunek z pewnością 95.00%."
            imageUrl: ""
            confidence: 0.95
            location:
              lat: 0
              lng: 0
      400:
        description: Brak pliku lub pusty plik
      422:
        description: Model niepewny swojej predykcji
      500:
        description: Błąd serwera
    """
    try:
        # Sprawdzenie, czy plik został dołączony do zapytania
        if 'image' not in request.files:
            return jsonify({"error": "Brak pliku obrazu w zapytaniu"}), 400

        file = request.files['image']

        # Sprawdzenie, czy plik nie jest pusty
        if file.filename == '':
            return jsonify({"error": "Wysłano pusty plik"}), 400

        if file:
            image_bytes = file.read()

            # Wywołujemy funkcję z Twojego skryptu `model_runner`
            predictions = predict_mushroom(image_bytes)

            # Bierzemy najlepszy wynik (pierwszy z listy)
            best_prediction = predictions[0]

            # Definiujemy próg pewności, poniżej którego wynik jest odrzucany
            CONFIDENCE_THRESHOLD = 0.60

            if best_prediction['confidence'] < CONFIDENCE_THRESHOLD:
                return jsonify({
                    "error": "Model nie jest pewny swojej predykcji. Czy na zdjęciu na pewno znajduje się grzyb?",
                }), 422  # 422 Unprocessable Entity

            # Składamy obiekt odpowiedzi dla frontendu
            # TODO: W przyszłości te dane będą pobierane z bazy danych
            result_for_frontend = {
                "id": "temp-id",
                "name": best_prediction['classNamePL'],
                "latinName": best_prediction['classNameEN'],
                "isEdible": True,
                "description": f"Model rozpoznał ten gatunek z pewnością {best_prediction['confidence']:.2%}.",
                "imageUrl": "",
                "confidence": best_prediction['confidence'],
                "location": {"lat": 0, "lng": 0}
            }

            return jsonify(result_for_frontend)

    except Exception as e:
        # Łapiemy każdy nieprzewidziany błąd z modelu lub przetwarzania
        print(f"!!! Wystąpił krytyczny błąd serwera: {e}")
        return jsonify({"error": f"Wystąpił wewnętrzny błąd serwera: {str(e)}"}), 500


# Uruchomienie serwera
if __name__ == "__main__":
    app.run(debug=True, port=5001)
