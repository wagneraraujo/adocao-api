import { z, ZodError } from "zod";
function formatZodErrors(error: ZodError) {
  return error.issues.map((issue) => {
    const path = issue.path.join(".");
    const message = issue.message;
    return { path, message };
  });
}

export default formatZodErrors;
