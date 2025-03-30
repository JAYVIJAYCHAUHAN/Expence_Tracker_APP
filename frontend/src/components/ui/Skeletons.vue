<template>
  <div>
    <!-- Export all skeletons as named slots -->
    <slot
      name="expense-card"
      v-if="name === 'expense-card'"
    >
      <ExpenseCardSkeleton :count="count" />
    </slot>

    <slot
      name="expense-list"
      v-else-if="name === 'expense-list'"
    >
      <ExpenseListSkeleton :count="count" />
    </slot>
    
    <slot
      name="chart"
      v-else-if="name === 'chart'"
    >
      <ChartSkeleton :height="height" />
    </slot>
    
    <slot
      name="summary-card"
      v-else-if="name === 'summary-card'"
    >
      <SummaryCardSkeleton :count="count" />
    </slot>
    
    <slot
      name="profile"
      v-else-if="name === 'profile'"
    >
      <ProfileSkeleton />
    </slot>
    
    <slot
      name="settings"
      v-else-if="name === 'settings'"
    >
      <SettingsSkeleton />
    </slot>
    
    <slot
      name="savings-goal"
      v-else-if="name === 'savings-goal'"
    >
      <SavingsGoalSkeleton :count="count" />
    </slot>
    
    <slot
      name="subscription"
      v-else-if="name === 'subscription'"
    >
      <SubscriptionSkeleton />
    </slot>
    
    <slot
      name="table"
      v-else-if="name === 'table'"
    >
      <TableSkeleton :rows="count" :columns="columns" />
    </slot>
    
    <slot
      name="notification"
      v-else-if="name === 'notification'"
    >
      <NotificationSkeleton :count="count" />
    </slot>
  </div>
</template>

<script setup lang="ts">
import ExpenseCardSkeleton from './skeletons/ExpenseCardSkeleton.vue';
import ExpenseListSkeleton from './skeletons/ExpenseListSkeleton.vue';
import ChartSkeleton from './skeletons/ChartSkeleton.vue';
import SummaryCardSkeleton from './skeletons/SummaryCardSkeleton.vue';
import ProfileSkeleton from './skeletons/ProfileSkeleton.vue';
import SettingsSkeleton from './skeletons/SettingsSkeleton.vue';
import SavingsGoalSkeleton from './skeletons/SavingsGoalSkeleton.vue';
import SubscriptionSkeleton from './skeletons/SubscriptionSkeleton.vue';
import TableSkeleton from './skeletons/TableSkeleton.vue';
import NotificationSkeleton from './skeletons/NotificationSkeleton.vue';

defineProps({
  name: {
    type: String,
    required: true,
    validator: (value: string) => [
      'expense-card',
      'expense-list',
      'chart',
      'summary-card',
      'profile',
      'settings',
      'savings-goal',
      'subscription',
      'table',
      'notification'
    ].includes(value)
  },
  count: {
    type: Number,
    default: 3
  },
  height: {
    type: String,
    default: '300px'
  },
  columns: {
    type: Number,
    default: 4
  }
});
</script> 