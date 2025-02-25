import { Status } from '../types';
import { HttpStatus } from "@nestjs/common";

export function toHttpStatus(status: Status): HttpStatus {
  switch (status) {
    case Status.INVALID_ARGUMENT:
    case Status.FAILED_PRECONDITION:
    case Status.CATEGORY_DONT_EXISTS:
      return 400;
    case Status.OUT_OF_RANGE:
      return 400;
    case Status.UNAUTHENTICATED:
      return 401;
    case Status.PERMISSION_DENIED:
      return 403;
    case Status.PERMISSION_TO_BRANCH_DENIED:
      return 403;
    case Status.NOT_FOUND_QUEUE_SKIP:
    case Status.NOT_FOUND:
      return 404;
    case Status.ALREADY_EXISTS:
    case Status.ABORTED:
      return 409;
    case Status.UNSUPPORTED_MEDIA_TYPE:
      return 415;
    case Status.RESOURCE_EXHAUSTED:
      return 429;
    case Status.CANCELLED:
      return 499 as HttpStatus;
    case Status.UNKNOWN:
    case Status.INTERNAL:
    case Status.DATA_LOSS:
    default:
      return 500;
    case Status.UNIMPLEMENTED:
      return 501;
    case Status.UNAVAILABLE:
      return 503;
    case Status.DEADLINE_EXCEEDED:
      return 504;
  }
}


export function toErrorType(status: Status) {
  switch (status) {
    case Status.INVALID_ARGUMENT:
      return 'InvalidArgumentError';
    case Status.FAILED_PRECONDITION:
      return 'FailedPreconditionError';
    case Status.OUT_OF_RANGE:
      return 'OutOfRangeError';
    case Status.UNAUTHENTICATED:
      return 'UnauthenticatedError';
    case Status.PERMISSION_DENIED:
      return 'PermissionDeniedError';
    case Status.NOT_FOUND_QUEUE_SKIP:
    case Status.NOT_FOUND:
      return 'NotFoundError';
    case Status.CATEGORY_DONT_EXISTS:
      return 'CategoryDoesNotExistError';
    case Status.ALREADY_EXISTS:
      return 'AlreadyExistsError';
    case Status.ABORTED:
      return 'AbortedError';
    case Status.RESOURCE_EXHAUSTED:
      return 'ResourceExhaustedError';
    case Status.CANCELLED:
      return 'CancelledError';
    case Status.INTERNAL:
      return 'InternalError';
    case Status.DATA_LOSS:
      return 'DataLossError';
    case Status.UNIMPLEMENTED:
      return 'UnimplementedError';
    case Status.UNAVAILABLE:
      return 'UnavailableError';
    case Status.DEADLINE_EXCEEDED:
      return 'DeadlineExceededError';
    case Status.UNSUPPORTED_MEDIA_TYPE:
      return 'UnsupportedMediaTypeError';
    case Status.PERMISSION_TO_BRANCH_DENIED:
      return 'PermissionDeniedToBranch';
    case Status.UNKNOWN:
    default:
      return 'UnknownError';
  }
}
