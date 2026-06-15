import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { FiCamera, FiSave } from 'react-icons/fi';

const ProfilePage = () => {
  const { user, updateProfile, loading } = useAuthStore();
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name,
      email: user?.email,
      phone: user?.phone
    }
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('phone', data.phone);
    
    if (data.avatar?.[0]) {
      formData.append('avatar', data.avatar[0]);
    }

    try {
      await updateProfile(formData);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Profile Settings</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-500">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-1 bg-primary-600 rounded-full cursor-pointer hover:bg-primary-700">
                <FiCamera className="w-4 h-4 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  {...register('avatar')}
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{user?.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="grid grid-cols-1 gap-6">
              <Input
                label="Full Name"
                {...register('name', { required: 'Name is required' })}
                error={errors.name?.message}
              />

              <Input
                label="Email Address"
                disabled
                {...register('email')}
              />

              <Input
                label="Phone Number"
                type="tel"
                {...register('phone')}
                error={errors.phone?.message}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" loading={loading} icon={FiSave}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Change Password Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Change Password</h2>
        <ChangePasswordForm />
      </div>
    </div>
  );
};

const ChangePasswordForm = () => {
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const { authApi } = await import('../../api/authApi');
      await authApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      toast.success('Password changed successfully');
      reset();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Current Password"
        type="password"
        {...register('currentPassword', { required: 'Current password is required' })}
        error={errors.currentPassword?.message}
      />
      <Input
        label="New Password"
        type="password"
        {...register('newPassword', {
          required: 'New password is required',
          minLength: {
            value: 6,
            message: 'Password must be at least 6 characters'
          }
        })}
        error={errors.newPassword?.message}
      />
      <Input
        label="Confirm New Password"
        type="password"
        {...register('confirmPassword', {
          required: 'Please confirm your password',
          validate: (value) => value === watch('newPassword') || 'Passwords do not match'
        })}
        error={errors.confirmPassword?.message}
      />
      <div className="flex justify-end">
        <Button type="submit" loading={loading}>
          Change Password
        </Button>
      </div>
    </form>
  );
};

export default ProfilePage;