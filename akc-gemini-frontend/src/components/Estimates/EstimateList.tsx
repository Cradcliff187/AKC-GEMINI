import React from 'react';
import { useAppContext } from '../../context/AppContext';

const EstimateList = () => {
  const { estimates } = useAppContext();

  return (
    <div className="shadow-md rounded my-4">
      <table className="min-w-full leading-normal">
        <thead>
          <tr>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Estimate Number
            </th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {estimates.map((estimate) => (
            <tr key={estimate.estimateId}>
              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                {estimate.estimateId}
              </td>
              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                {estimate.estimatedAmount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EstimateList;