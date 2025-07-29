import { useEffect, useState, useCallback, useRef } from 'react';
import { eq, desc, count } from 'drizzle-orm';
import { db } from './database';
import { partners, activities, type Partner, type NewPartner } from '~/db/schema';
import type { ListPartner, RelationshipType } from '~/types';

// Partner functions
const addPartner = async (name: string, relationshipType?: RelationshipType): Promise<number> => {
  const newPartner: NewPartner = {
    name,
    relationshipType: relationshipType as RelationshipType | null,
  };

  const result = await db.insert(partners).values(newPartner).returning({ id: partners.id });
  return result[0].id;
};

const getAllPartners = async (): Promise<ListPartner[]> => {
  const result = await db
    .select({
      id: partners.id,
      name: partners.name,
      relationshipType: partners.relationshipType,
      createdAt: partners.createdAt,
      activityCount: count(activities.id),
    })
    .from(partners)
    .leftJoin(activities, eq(partners.name, activities.partner))
    .groupBy(partners.id)
    .orderBy(desc(partners.createdAt));

  return result;
};

const removePartner = async (id: number): Promise<void> => {
  await db.delete(partners).where(eq(partners.id, id));
};

const updatePartner = async (
  id: number,
  name: string,
  relationshipType?: RelationshipType
): Promise<void> => {
  await db
    .update(partners)
    .set({
      name,
      relationshipType: relationshipType as RelationshipType | null,
    })
    .where(eq(partners.id, id));
};

// React hook for partners
export function usePartnersStore() {
  const [partnerList, setPartnerList] = useState<ListPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const initializeAndLoad = async () => {
      try {
        setInitialized(true);
        const allPartners = await getAllPartners();
        setPartnerList(allPartners);
      } catch (error) {
        console.error('Error initializing partners:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAndLoad();
  }, []);

  const refreshPartners = useCallback(async () => {
    if (!initialized) return;
    try {
      const allPartners = await getAllPartners();
      setPartnerList(allPartners);
    } catch (error) {
      console.error('Error refreshing partners:', error);
    }
  }, [initialized]);

  const addPartnerWrapper = useCallback(
    async (name: string, relationshipType?: RelationshipType) => {
      if (!initialized) return;
      try {
        await addPartner(name, relationshipType);
        await refreshPartners();
      } catch (error) {
        console.error('Error adding partner:', error);
      }
    },
    [initialized, refreshPartners]
  );

  const removePartnerWrapper = useCallback(
    async (id: number) => {
      if (!initialized) return;
      try {
        await removePartner(id);
        await refreshPartners();
      } catch (error) {
        console.error('Error removing partner:', error);
      }
    },
    [initialized, refreshPartners]
  );

  const updatePartnerWrapper = useCallback(
    async (id: number, name: string, relationshipType?: RelationshipType) => {
      if (!initialized) return;
      try {
        await updatePartner(id, name, relationshipType);
        await refreshPartners();
      } catch (error) {
        console.error('Error updating partner:', error);
      }
    },
    [initialized, refreshPartners]
  );

  return {
    partners: partnerList,
    loading,
    initialized,
    addPartner: addPartnerWrapper,
    removePartner: removePartnerWrapper,
    updatePartner: updatePartnerWrapper,
    refreshPartners,
  };
}

// Export types
export type { Partner, RelationshipType };
