import fileDownload from 'js-file-download';
import Papa from 'papaparse';
import React from 'react';
import { FileTrigger } from 'react-aria-components';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'starfx/react';

import { schema } from '~/store/schema/index.ts';
import { importEntries } from '~/store/thunks/import.ts';

import { Button } from '~/elements/Button.tsx';

const Importing = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleUpload = async (files: FileList | null) => {
    if (!files) return;
    const [file] = files;

    if (file) {
      const content = await file.text();
      if (file.name.endsWith('.json')) {
        const result = JSON.parse(content) as any;
        console.log('file upload result', result);
        dispatch(importEntries(result as any));
        navigate(`/planning`);
      } else if (file.name.endsWith('.csv')) {
        const result = {
          accounts: Papa.parse(content, { header: true }).data
        } as any;
        console.log('file upload result', result);
        dispatch(importEntries(result as any));
        navigate(`/planning`);
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
  const chartRange = useSelector(schema.chartRange.select);
  const handleDownload = () => {
    let outputData = {
      accounts,
      transactions,
      chartRange
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
    <div className="divide-y-2 divide-gray-200">
      <div className="pb-4">
        <h1 className="text-3xl font-semibold">Importing and Exporting</h1>
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
  );
};

export default Importing;
