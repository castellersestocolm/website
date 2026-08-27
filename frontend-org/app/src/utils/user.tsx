export function userToName(user: any) {
  return (
    user &&
    (user.lastname ? user.firstname + " " + user.lastname : user.firstname)
  );
}

export function userAge(birthdayString: string) {
  const today = new Date();
  const birthday = new Date(birthdayString);
  let age = today.getFullYear() - birthday.getFullYear();
  const m = today.getMonth() - birthday.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) {
    age--;
  }
  return age;
}
