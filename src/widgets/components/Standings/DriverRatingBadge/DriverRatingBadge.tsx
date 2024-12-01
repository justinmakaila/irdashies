export type DriverRatingBadgeProps = {
  license?: string;
  rating?: number;
};

export const DriverRatingBadge = ({
  license = 'R',
  rating = 0,
}: DriverRatingBadgeProps) => {
  const licenseLevel = license?.charAt(0) || 'R';
  const colorMap: { [key: string]: string } = {
    A: 'border-blue-500 bg-blue-800',
    B: 'border-green-500 bg-green-800',
    C: 'border-yellow-500 bg-yellow-700',
    D: 'border-orange-500 bg-orange-700',
    R: 'border-red-500 bg-red-800',
  };
  const color = colorMap[licenseLevel] ?? '';
  let fixed = 1;
  if (rating >= 10000) fixed = 0;
  const simplifiedRating = (rating / 1000).toFixed(fixed);
  return (
    <div
      className={`text-center text-white w-16 border-solid rounded-md text-xs m-0 px-1 border-2 ${color}`}
    >
      {license} {simplifiedRating}k
    </div>
  );
};
