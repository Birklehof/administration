import Icon from './Icon';

interface ErrorAlertProps {
  message: string;
}

export default function ErrorAlert({ message }: ErrorAlertProps) {
  return (
    <>
      <div className="flex justify-center items-center">
        <p className="flex flex-row gap-1 text-error text-center">
          <Icon name="ExclamationCircleIcon" />
          {message}
        </p>
      </div>
    </>
  );
}
