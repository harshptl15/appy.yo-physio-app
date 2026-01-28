/**
 * WhereDTO represents the location where an exercise is performed (home or gym).
 * Used to transmit location-related data to/from the controller and DAO.
 */

const LocationType = Object.freeze({
  HOME: 'home',
  GYM: 'gym'
});

class WhereDTO {
  /**
   * @param {{ id: number, location: string }} data
   */
  constructor({ id, location }) {
    this.id = id;
    this.location = location;
  }

  get id() {
    return this._id;
  }

  set id(value) {
    this._id = value;
  }

  get location() {
    return this._location;
  }

  set location(value) {
    this._location = value;
  }
}

// Export the WhereDTO class
module.exports = { WhereDTO };