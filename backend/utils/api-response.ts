import { Response, Request } from "express";
import { ZodError } from "zod";

export const Ok = ({
  res,
  data,
  pagination,
  message,
}: {
  res: Response;
  data?: any;
  pagination?: {
    page?: number;
    page_size?: number;
    search?: string;
  };
  message?: string;
}) => {
  const response = {
    status: 200,
    message: message ?? "Successfully",
    ...(pagination && { pagination: pagination }),
    data: data,
  };

  res.status(response.status).json(response);
};

export const Created = ({
  res,
  data,
  message,
}: {
  res: Response;
  data?: any;
  message?: string;
}) => {
  const response = {
    status: 201,
    message: message ?? "Created",
    data: data,
  };

  res.status(response.status).json(response);
};

export const Download = ({
  res,
  path,
  filename,
}: {
  res: Response;
  path: any;
  filename: string;
}) => {
  // res.setHeader("Content-Type", "application/octet-stream");
  // res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
  res.status(200).download(path);
};

export const BadRequest = ({
  res,
  data,
  message,
}: {
  res: Response;
  data?: any;
  message?: string;
}) => {
  const response = {
    status: 400,
    message: message ?? "Bad Request",
    data: data,
  };
  res.status(response.status).json(response);
};

export const Unauthorized = ({
  res,
  data,
  message,
}: {
  res: Response;
  data?: any;
  message?: string;
}) => {
  const response = {
    status: 401,
    message: message ?? "Unauthorized",
    data: data,
  };
  res.status(response.status).json(response);
};

export const Forbidden = ({
  res,
  data,
  message,
}: {
  res: Response;
  data?: any;
  message?: string;
}) => {
  const response = {
    status: 403,
    message: message ?? "Forbidden",
    data: data,
  };
  res.status(response.status).json(response);
};

export const NotFound = ({
  res,
  data,
  message,
}: {
  res: Response;
  data?: any;
  message?: string;
}) => {
  const response = {
    status: 404,
    message: message ?? "Not Found",
    data: data,
  };
  res.status(response.status).json(response);
};

export const InternalServerError = ({
  res,
  data,
  message,
}: {
  res: Response;
  data?: any;
  message?: string | any;
}) => {
  const response = {
    status: 500,
    message: message ?? "Internal Server Error",
    data: data,
  };
  res.status(response.status).json(response);
};

export const ErrorResponse = ({
  req,
  res,
  error,
}: {
  req: Request;
  res: Response;
  error?: any;
}) => {
  // logger.error(`Request Error:
  //   \nError:\n${JSON.stringify(error)}
  //   \nHeaders:\n${inspect(req.headers)}
  //   \nParams:\n${inspect(req.params)}
  //   \nQuery:\n${inspect(req.query)}
  //   \nBody:\n${inspect(req.body)}`);

  if (error instanceof ZodError) {
    return BadRequest({
      res,
      data: error,
      message: error.issues[0].message,
    });
  }

  if (error instanceof Error) {
    return BadRequest({ res, data: error, message: error.message });
  }

  if (typeof error === "string") {
    return BadRequest({ res, message: error });
  }

  return InternalServerError({ res });
};
