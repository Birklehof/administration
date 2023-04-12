function validateEmail(email: string): boolean {
  var re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
  return re.test(email);
}

export { validateEmail };
