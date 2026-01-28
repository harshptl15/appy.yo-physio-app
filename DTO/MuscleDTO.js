/**
 * MuscleDTO represents a muscle name and category (stretch, strengthen, or avoid).
 * Used for transferring muscle-related data to/from the controller and DAO.
 */

const CategoryType = Object.freeze({
  STRETCH: 'stretch',
  STRENGTHEN: 'strengthen',
  AVOID: 'avoid'
});

class MuscleDTO {
  /**
   * @param {{ id: number, muscleName: string, category: string }} data
   */
  constructor({ id, muscleName, category }) {
    this.id = id;
    this.muscleName = muscleName;
    this.category = category;
  }

  get id() {
    return this._id;
  }

  set id(value) {
  
    this._id = value;
  }

  get muscleName() {
    return this._muscleName;
  }

  set muscleName(value) {
  
    this._muscleName = value;
  }

  get category() {
    return this._category;
  }

  set category(value) {
   
    this._category = value;
  }
}

// Export the MuscleDTO class and CategoryType enum
module.exports = { MuscleDTO, CategoryType };
