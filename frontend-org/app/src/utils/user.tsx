export function userToName(user: any) {
  return (
    user &&
    (user.lastname ? user.firstname + " " + user.lastname : user.firstname)
  );
}
