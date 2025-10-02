const inMemoryUsers = new Map();

export async function createUser({ id, name, email, passwordHash, image }) {
  inMemoryUsers.set(email, { id, name, email, passwordHash, image });
  return inMemoryUsers.get(email);
}

export async function getUserByEmail(email) {
  return inMemoryUsers.get(email) || null;
}


