import apiClient from '../apiClient';

export const deleteWallet = async (id) => {
    try {
        const response = await apiClient.delete(`/wallets/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting wallet with ID ${id}:`, error);
        throw error;
    }
};

