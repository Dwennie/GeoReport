import React from 'react';
import { Head } from '@inertiajs/react';
import AppearanceTabs from '@/components/AppearanceTabs';
import Heading from '@/components/Heading';
import SettingsLayout from '@/layouts/settings/Layout';

export default function Appearance() {
    return (
        <SettingsLayout>
            <Head title="Appearance settings" />

            <h1 className="sr-only">Appearance settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Appearance settings"
                    description="Update the appearance settings for your account"
                />
                <AppearanceTabs />
            </div>
        </SettingsLayout>
    );
}
