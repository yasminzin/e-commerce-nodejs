exports.validation = (schema) => {
  return (req, res, next) => {
    let validationObject = schema.validate(
      { ...req.body, ...req.params },
      {
        abortEarly: false,
      }
    );
    //   console.log(`validationObject : ${validationObject}`);
    //   console.log(`validationObject.error : ${validationObject.error}`);
    //   console.log(`validationObject.details : ${validationObject.error.details}`);
    if (validationObject.error) {
      return res
        .status(422)
        .json({ status: "fail", message: validationObject.error.details });
    } else {
      next();
    }
  };
};
