import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsUUID } from 'class-validator';
import { CompanyRole } from '../../common/enums/company-role.enum';

export class AddCompanyMemberDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  userId: string;

  @ApiProperty({ enum: CompanyRole, example: CompanyRole.MEMBER })
  @IsEnum(CompanyRole)
  role: CompanyRole;
}
