import React, { useEffect } from 'react';
import moment from 'moment';
import { detectLocale } from '../utils/detect-local';

const RelativeTime = ({ timestamp }: { timestamp: number }) => {
    useEffect(() => {
        // Detect and set the locale dynamically when the component mounts
        const locale = detectLocale();
        moment.locale(locale); // Set moment.js locale
    }, []);

    // Convert the timestamp (in seconds) to milliseconds
    const date = moment.unix(timestamp);

    // Get the relative time string
    const relativeTime = date.fromNow();

    return <span title={date.toISOString()}>{relativeTime}</span>;
};

export default RelativeTime;
