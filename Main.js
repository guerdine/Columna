import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

export default function App() {
  const [inputs, setInputs] = useState({
    incidencia_pelvica: "",
    inclinacion_pelvica: "",
    angulo_lordosis_lumbar: "",
    pendiente_sacra: "",
    radio_pelvico: "",
    grado_espondilolistesis: "",
  });

  const [resultado, setResultado] = useState(null);

  const handleInputChange = (field, value) => {
    const numericValue = value.replace(/[^0-9.]/g, ""); // Solo permite números y puntos
    if (/^\d*\.?\d{0,2}$/.test(numericValue)) {
      setInputs((prev) => ({ ...prev, [field]: numericValue }));
    }
  };

  const handleSubmit = async () => {
    if (Object.values(inputs).some((val) => val.trim() === "")) {
      setResultado("Por favor, completa todos los campos.");
      return;
    }

    const url = "http://107.21.91.140:8720/predict"; // Ajusta la IP si es necesario
    const payload = {
      incidencia_pelvica: parseFloat(inputs.incidencia_pelvica),
      inclinacion_pelvica: parseFloat(inputs.inclinacion_pelvica),
      angulo_lordosis_lumbar: parseFloat(inputs.angulo_lordosis_lumbar),
      pendiente_sacra: parseFloat(inputs.pendiente_sacra),
      radio_pelvico: parseFloat(inputs.radio_pelvico),
      grado_espondilolistesis: parseFloat(inputs.grado_espondilolistesis),
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (response.ok) {
        const condicion = parseInt(data.prediccion, 10) === 0 ? "Anormal" : "Normal";
        setResultado(`El paciente tiene una condición ${condicion}`);
      } else {
        setResultado(`Error en el servidor: ${data.error || "Error desconocido"}`);
      }
    } catch (error) {
      setResultado("No se pudo conectar al servidor.");
    }
  };

  const getResultColor = () => {
    if (!resultado) return "transparent";
    if (resultado.includes("Normal")) return "#6ED46E"; // Verde
    if (resultado.includes("Anormal")) return "#FFA500"; // Naranja
    return "#FF6B6B"; // Rojo (Errores)
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Análisis de Riesgo de Columna</Text>
        <Text style={styles.subtitle}>Elaborado por: Daniel Vásquez 2025</Text>

        {Object.keys(inputs).map((field, index) => (
          <View key={index} style={styles.inputContainer}>
            <Text style={styles.label}>{field.replace(/_/g, " ").toUpperCase()}</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder={`Ingresa ${field.replace(/_/g, " ")}`}
              placeholderTextColor="#999"
              value={inputs[field]}
              onChangeText={(value) => handleInputChange(field, value)}
            />
          </View>
        ))}

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Calcular Predicción</Text>
        </TouchableOpacity>

        {/* Línea divisoria */}
        <View style={styles.separator} />

        {/* Caja de resultados */}
        {resultado && (
          <>
            <View style={[styles.resultContainer, { backgroundColor: getResultColor() }]}>
              <Text style={styles.resultText}>{resultado}</Text>
            </View>

            {/* Separador debajo del resultado */}
            <View style={styles.bottomSeparator} />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 40,
  },
  content: {
    paddingHorizontal: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#444",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#ff6b6b",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
    width: "70%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  separator: {
    width: "100%",
    height: 1,
    backgroundColor: "#ccc",
    marginVertical: 20,
  },
  resultContainer: {
    padding: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  resultText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  bottomSeparator: {
    width: "100%",
    height: 20, // Espacio extra para que no quede pegado abajo
  },
});
