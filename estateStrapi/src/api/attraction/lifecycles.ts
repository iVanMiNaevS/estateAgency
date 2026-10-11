/**
 * attraction lifecycles
 *
 * Возраст и рост из ТЗ п.1 — ключевые ограничения безопасности,
 * поэтому проверяем их согласованность на сервере.
 */

const validateRanges = (data: any) => {
  const ageMin = data.ageMin;
  const ageMax = data.ageMax;
  const heightMinCm = data.heightMinCm;
  const heightMaxCm = data.heightMaxCm;

  if (ageMin != null && ageMax != null && Number(ageMax) < Number(ageMin)) {
    throw new Error('Максимальный возраст не может быть меньше минимального');
  }
  if (heightMinCm != null && heightMaxCm != null && Number(heightMaxCm) < Number(heightMinCm)) {
    throw new Error('Максимальный рост не может быть меньше минимального');
  }
  for (const [field, value] of Object.entries({ ageMin, ageMax, heightMinCm, heightMaxCm })) {
    if (value != null && (!Number.isInteger(Number(value)) || Number(value) < 0)) {
      throw new Error(`Поле ${field} должно быть целым неотрицательным числом`);
    }
  }
  if (data.basePrice != null && Number(data.basePrice) < 0) {
    throw new Error('Цена не может быть отрицательной');
  }
  if (data.durationMinutes != null && Number(data.durationMinutes) < 1) {
    throw new Error('Длительность должна быть не меньше 1 минуты');
  }
};

export default {
  async beforeCreate(event: any) {
    if (event.params?.data) validateRanges(event.params.data);
  },

  async beforeUpdate(event: any) {
    if (event.params?.data) validateRanges(event.params.data);
  },
};