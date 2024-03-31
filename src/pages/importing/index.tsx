import fileDownload from 'js-file-download';
import Papa from 'papaparse';
import React from 'react';
import { FileTrigger } from 'react-aria-components';
import { useDispatch, useSelector } from 'starfx/react';

import { schema } from '~/src/store/schema';
import { dateRangeWithStrings } from '~/src/store/selectors/chartRange';
import { importEntries } from '~/src/store/thunks/import';

import { Button } from '~/src/elements/Button';

const Importing = () => {
  const dispatch = useDispatch();

  const handleUpload = async (files: FileList | null) => {
    if (!files) return;
    const [file] = files;

    if (file) {
      const content = await file.text();
      if (file.name.endsWith('.json')) {
        const result = JSON.parse(content);
        console.log('file upload result', result);
        return dispatch(importEntries(result));
      } else if (file.name.endsWith('.csv')) {
        const result = {
          accounts: Papa.parse(content, { header: true }).data
        };
        console.log('file upload result', result);
        return dispatch(importEntries(result));
      } else {
        console.warn(
          "Invalid filetype, not a json or csv. We didn't do anything with the file you uploaded."
        );
      }
    } else {
      console.warn('Select one file');
    }
  };

  const accounts = useSelector(schema.accounts.selectTableAsList);
  const transactions = useSelector(schema.transactions.selectTableAsList);
  const graphRange = useSelector(dateRangeWithStrings);
  const handleDownload = () => {
    console.log({ accounts, transactions });

    let outputData = {
      accounts,
      transactions,
      graphRange: { start: graphRange.startString, end: graphRange.endString }
    };

    // ...(get(['taxStrategy', 'incomeReceived'], modelState) &&
    //   modelState.taxStrategy.incomeReceived.length !== 0
    //     ? {
    //         taxStrategy: {
    //           incomeReceived: [...modelState.taxStrategy.incomeReceived]
    //         }
    //       }
    //     : {}),

    let fileData = JSON.stringify(outputData, null, 2);
    fileDownload(fileData, 'financials.json');
  };

  return (
    <div className="bg-gray-50 pt-16 pb-20 px-4 sm:px-6 lg:pt-24 lg:pb-28 lg:px-8">
      <div className="relative max-w-lg mx-auto divide-y-2 divide-gray-200 lg:max-w-7xl">
        <div className="pb-6">
          <h2 className="text-3xl tracking-tight font-extrabold text-gray-900 sm:text-4xl">
            Importing and Exporting
          </h2>
          <p className="text-xl text-gray-500">The data is yours to own.</p>
        </div>
        <div>
          <div>
            <p className="my-3 text-base text-gray-500">
              Get your current data out
            </p>
            <Button onPress={() => handleDownload()}>Download</Button>
          </div>
          <div>
            <p className="my-3 text-base text-gray-500">
              Import data from your computer
            </p>
            <FileTrigger
              acceptedFileTypes={['application/json', 'text/csv']}
              onSelect={handleUpload}
            >
              <Button>Select file</Button>
            </FileTrigger>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Importing;