/**
 * Weight Measurement Data Model
 */
class WeightMeasurement {
  constructor({ id, weight, ocr_confidence, captured_at, created_at, updated_at }) {
    this.id = id;
    this.weight = parseFloat(weight);
    this.ocr_confidence = parseFloat(ocr_confidence);
    this.captured_at = captured_at;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}

module.exports = WeightMeasurement;
