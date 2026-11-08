<script setup lang="ts">
import { Head, useForm } from '@inertiajs/vue3';
import TextLink from '@/components/TextLink.vue';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { logout } from '@/routes';

defineOptions({
    layout: {
        title: 'Email verification',
        description: 'Email verification is not required for this environment.',
    },
});

defineProps<{
    status?: string;
}>();

const form = useForm({});

function submit(): void {
    form.post('/email/verification-notification');
}
</script>

<template>
    <Head title="Email verification" />

    <div
        v-if="status === 'verification-link-sent'"
        class="mb-4 text-center text-sm font-medium text-green-600"
    >
        A new verification link has been sent to your email address.
    </div>

    <form @submit.prevent="submit" class="space-y-6 text-center">
        <Button :disabled="form.processing" variant="secondary">
            <Spinner v-if="form.processing" />
            Resend verification email
        </Button>

        <TextLink :href="logout()" as="button" class="mx-auto block text-sm">
            Log out
        </TextLink>
    </form>
</template>
