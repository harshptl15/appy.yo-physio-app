/**
 * author: Luke Johnson
 * this is the dto for the user, it contains the user id, username, and password.
 * 
 */

class UserDTO {
  /**
   * @param {{ id: number, userName: string, password: string }} data
   */
  constructor({ id, userName, password }) {
    this.id = id;
    this.userName = userName;
    this.password = password;
  }

  get id() {
    return this._id;
  }

  get userName() {
    return this._userName;
  }

  get password() {
    return this._password;
  }

  set id(value) {
    this._id = value;
  }

  set userName(value) {
    this._userName = value;
  }

  set password(value) {
    this._password = value;
  }
}

//export the UserDTO class
module.exports = {UserDTO};