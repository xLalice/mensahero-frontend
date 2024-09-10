import React from "react";
import ReactLoading from "react-loading";

type LoadingProps = {
  height: number;
  width: number;
};

const Loading: React.FC<LoadingProps> = ({ height, width }) => {
  return (
    <div className="flex items-center justify-center h-screen">
      <ReactLoading type="spin" color="#00ADB5" height={height} width={width} />
    </div>
  );
};

export default Loading;
