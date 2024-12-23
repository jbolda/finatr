import React from 'react';
import { NavigateFunction } from 'react-router-dom';
import type { Dispatch } from 'redux';
import type { AnyAction } from 'starfx';
import { useSelector } from 'starfx/react';

import { transactionsInTimeline } from '~/src/store/selectors/transactions';

import { TransactionFilter } from './utils';

const timeline = [
  {
    id: 1,
    content: 'Applied to',
    target: 'Front End Developer',
    href: '#',
    date: 'Sep 20',
    datetime: '2020-09-20',
    icon: 'UserIcon',
    iconBackground: 'bg-gray-400'
  },
  {
    id: 2,
    content: 'Advanced to phone screening by',
    target: 'Bethany Blake',
    href: '#',
    date: 'Sep 22',
    datetime: '2020-09-22',
    icon: 'HandThumbUpIcon',
    iconBackground: 'bg-blue-500'
  },
  {
    id: 3,
    content: 'Completed phone screening with',
    target: 'Martha Gardner',
    href: '#',
    date: 'Sep 28',
    datetime: '2020-09-28',
    icon: 'CheckIcon',
    iconBackground: 'bg-green-500'
  },
  {
    id: 4,
    content: 'Advanced to interview by',
    target: 'Bethany Blake',
    href: '#',
    date: 'Sep 30',
    datetime: '2020-09-30',
    icon: 'HandThumbUpIcon',
    iconBackground: 'bg-blue-500'
  },
  {
    id: 5,
    content: 'Completed interview with',
    target: 'Katherine Snyder',
    href: '#',
    date: 'Oct 4',
    datetime: '2020-10-04',
    icon: 'CheckIcon',
    iconBackground: 'bg-green-500'
  }
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export const TransactionTimeline = ({
  navigate,
  dispatch,
  transactionFilter
}: {
  navigate: NavigateFunction;
  dispatch: Dispatch<AnyAction>;
  transactionFilter: TransactionFilter;
}) => {
  const transactionsTimeline = useSelector(transactionsInTimeline);
  {
    /* <div>
          {transactionsTimeline.map((d) => (
            <div key={d.date.toISOString()}>
              {d.date.toISOString()}{' '}
              {d.transactions.map((t) => t.description).join(',')}
            </div>
          ))}
        </div> */
  }

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {timeline.map((event, eventIdx) => (
          <li key={event.id}>
            <div className="relative pb-8">
              {eventIdx !== timeline.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span
                    className={classNames(
                      event.iconBackground,
                      'flex size-8 items-center justify-center rounded-full ring-8 ring-white'
                    )}
                  >
                    <event.icon
                      aria-hidden="true"
                      className="size-5 text-white"
                    />
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm text-gray-500">
                      {event.content}{' '}
                      <a
                        href={event.href}
                        className="font-medium text-gray-900"
                      >
                        {event.target}
                      </a>
                    </p>
                  </div>
                  <div className="whitespace-nowrap text-right text-sm text-gray-500">
                    <time dateTime={event.datetime}>{event.date}</time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
